import { testUtils } from "./tests/testUtils";
import { testIndex } from "./tests/testIndex";


(async ()=>{
    await testUtils();
    //await testIndex();

})().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});