const Inventory = require("../models/Inventory");

exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { stock } = req.body;
    const updatedInventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    res.status(200).json(updatedInventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
