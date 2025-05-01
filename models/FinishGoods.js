// models/FinishGoods.js
import mongoose from 'mongoose';

let FinishGoods;

try {
  FinishGoods = mongoose.model('FinishGoods');
} catch {
  const FinishGoodsSchema = new mongoose.Schema({
    jumboId: { type: String, required: true, ref: 'Jumbo' },
    lineNo: { type: Number, required: true },
    finishGoodsId: { type: String, required: true },
    finishGoodsWeight: { type: Number, required: true },
    scrapWeight: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  FinishGoods = mongoose.model('FinishGoods', FinishGoodsSchema);
}

export default FinishGoods;