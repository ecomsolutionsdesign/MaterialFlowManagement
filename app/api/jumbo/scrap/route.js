// app/api/jumbo/scrap/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Jumbo from '../../../../models/Jumbo';
import FinishGoods from '../../../../models/FinishGoods';
import RawMaterial from '../../../../models/RawMaterial';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all jumbos with scrap
    const jumbos = await Jumbo.find({}).sort({ createdAt: -1 });
    const finishGoods = await FinishGoods.find({});
    
    // Get all raw materials to check which scrap has been used
    const rawMaterials = await RawMaterial.find({});
    
    // Calculate available scrap for each jumbo
    const availableScrap = [];
    
    for (const jumbo of jumbos) {
      // Get the initial scrap from jumbo creation
      let initialScrap = jumbo.scrapWeight || 0;
      
      // Add scrap from finish goods processing
      const finishGoodsScrap = finishGoods
        .filter(fg => fg.jumboId === jumbo.jumboId)
        .reduce((total, fg) => total + (fg.scrapWeight || 0), 0);
      
      // Total scrap produced from this jumbo
      const totalScrap = initialScrap + finishGoodsScrap;
      
      // Calculate how much scrap has been used in raw materials
      const usedScrap = rawMaterials.reduce((total, rm) => {
        const usedFromThisJumbo = rm.scrapJumboSources
          .filter(source => source.jumboId === jumbo.jumboId)
          .reduce((sum, source) => sum + (source.weight || 0), 0);
        return total + usedFromThisJumbo;
      }, 0);
      
      // Calculate remaining available scrap
      const availableWeight = totalScrap - usedScrap;
      
      if (availableWeight > 0) {
        availableScrap.push({
          jumboId: jumbo.jumboId,
          weight: availableWeight,
        });
      }
    }
    
    return NextResponse.json(availableScrap);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}