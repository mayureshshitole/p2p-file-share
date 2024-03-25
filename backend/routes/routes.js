import express from "express";

export const route = express.Router();

export const makeRoom = (req, res) => {
  res.send("inside make room");
};

route.get("/", (req, res) => {
  res.send("Hello UltraShare");
});

route.use("/make_room", makeRoom);
