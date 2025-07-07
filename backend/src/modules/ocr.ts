import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (imagePath: string): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng', // Idioma del OCR, se puede cambiar según sea necesario
      {
        logger: (info: { status: string; progress: number }) => console.log(info), // Opcional: Log de progreso
      }
    );
    return text;
  } catch (error) {
    console.error('Error al procesar la imagen con OCR:', error);
    throw error;
  }
};
