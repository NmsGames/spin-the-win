const express = require("express");
const FunTrgtTimer = require("../gameplay/FunTargetTimer").gameTimer;
const router = express();
router.use(express.json());

 

router.post("/getTimer",async (req,res) => {
	let {game_id} = req.body;
	if(game_id === 3) {
		let CurrTimer = await FunTrgtTimer();
		let timer = (CurrTimer) ? CurrTimer : 0
		return res.status(200).json({ status: true, message:"Game Timer", timer:timer });
	}

	return res.status(400).json({ status: false, message: "Invalid Request" , timer:[]});
	
})

module.exports = router;