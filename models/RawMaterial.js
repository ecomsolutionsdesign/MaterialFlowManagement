// models/RawMaterial.js
import mongoose from 'mongoose';

let RawMaterial;

try {
    RawMaterial = mongoose.model('RawMaterial');
} catch {
    const RawMaterialSchema = new mongoose.Schema({
        jumboId: { type: String, required: true, ref: 'Jumbo' },
        lineNo: { type: Number, required: true },
        rawMaterialWeight: { type: Number, required: true },
        scrapWeight: { type: Number, required: true },
        scrapJumboSources: [{
            jumboId: { type: String, ref: 'Jumbo' },
            weight: { type: Number }
        }],
        createdAt: { type: Date, default: Date.now },
    });

    RawMaterial = mongoose.model('RawMaterial', RawMaterialSchema);
}

export default RawMaterial;