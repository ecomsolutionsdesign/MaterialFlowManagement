// lib/utils.js
import Jumbo from '../models/Jumbo'; // Import the Jumbo model to query the database
import { connectToDatabase } from './mongodb'; // Import the database connection function

async function getNextLetterSequence(lineNo, currentDate) { // currentDate is now a parameter
  try {
    await connectToDatabase();

    const year = currentDate.getFullYear().toString().slice(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const datePart = `${lineNo}${year}${month}${day}`;

    const lastJumbo = await Jumbo.findOne({
      jumboId: { $regex: `^${datePart}` } // Find IDs starting with the date and lineNo
    }).sort({ jumboId: -1 });

    let lastLetter = '';
    if (lastJumbo && lastJumbo.jumboId) {
      const lastId = lastJumbo.jumboId;
      // Extract the last letter sequence (assuming it's at the end)
      lastLetter = lastId.slice(datePart.length);
    }

    let nextLetter = 'A';
    if (lastLetter) {
      nextLetter = incrementLetterSequence(lastLetter);
    }

    return nextLetter;

  } catch (error) {
    console.error('Error getting next letter sequence:', error);
    return 'A'; // Default to 'A' in case of an error
  }
}

function incrementLetterSequence(sequence) {
  let carry = 1;
  let result = '';
  for (let i = sequence.length - 1; i >= 0; i--) {
    const charCode = sequence.charCodeAt(i);
    const newCharCode = charCode + carry;

    if (newCharCode > 90) { // 'Z'
      result = 'A' + result;
      carry = 1;
    } else {
      result = String.fromCharCode(newCharCode) + result;
      carry = 0;
    }
  }
  if (carry) {
    result = 'A' + result;
  }
  return result;
}

export async function generateJumboId(lineNo, selectedDate) { // Accept selectedDate as argument
  const year = selectedDate.getFullYear().toString().slice(-2);
  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = selectedDate.getDate().toString().padStart(2, '0');

  const nextLetterSequence = await getNextLetterSequence(lineNo, selectedDate);

  return `${lineNo}${year}${month}${day}${nextLetterSequence}`;
}