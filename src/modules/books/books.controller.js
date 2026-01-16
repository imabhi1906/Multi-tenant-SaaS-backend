const prisma = require('../../utils/prisma');
const { z } = require('zod');

const bookSchema = z.object({
  title: z.string(),
  isbn: z.string().optional(),
  price: z.number().positive(),
  authorId: z.string(),
  categoryId: z.string(),
});

const getBooks = async (req, res, next) => {
  try {
    // Automatically filtered by tenant_id via Prisma extension
    const books = await prisma.book.findMany({
      include: {
        author: true,
        category: true,
      },
    });
    res.json(books);
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const validatedData = bookSchema.parse(req.body);

    // tenant_id is automatically added via Prisma extension
    const book = await prisma.book.create({
      data: {
        title: validatedData.title,
        isbn: validatedData.isbn,
        price: validatedData.price,
        author_id: validatedData.authorId,
        category_id: validatedData.categoryId,
      },
    });

    res.status(201).json(book);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = bookSchema.partial().parse(req.body);

    // tenant_id check is implicit in the where clause via Prisma extension
    const book = await prisma.book.update({
      where: { id },
      data: validatedData,
    });

    res.json(book);
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // tenant_id check is implicit in the where clause via Prisma extension
    await prisma.book.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, createBook, updateBook, deleteBook };
