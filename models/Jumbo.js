// models/Jumbo.js
import mongoose from 'mongoose';

let Jumbo;

try {
  Jumbo = mongoose.model('Jumbo');
} catch {
  const JumboSchema = new mongoose.Schema({
    jumboId: { type: String, required: true, unique: true },
    lineNo: { type: Number, required: true },
    weight: { type: Number, required: true },
    scrapWeight: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  Jumbo = mongoose.model('Jumbo', JumboSchema);
}

export default Jumbo;