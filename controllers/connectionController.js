import ConnectionRequest from "../models/connectionModel.js";
import { aysncHandler } from "../utils/aysncHandler.js";
import { CustomError } from "../utils/customError.js";

export const connectionRequestHandler = aysncHandler(async (req, res, next) => {
  const senderId = req.user._id;
  const receiverId = req.params.toUserId;
  const status = req.params.status;

  const receiver = await User.findOne({ receiverId });
  if (!receiver) {
    const error = new CustomError("user you ting to send request dont exist");
    next();
  }

  // alowing statuses only interested and ignored

  const allowedStatus = ["interested", "ignored"];
  if (!allowedStatus.includes(status)) {
    const error = new CustomError("invalid status type ", 400);
    return next(error);
  }
  // if request is already sent
  const isRequestExists = await ConnectionRequest.findOne({
    $or: [
      { senderId, receiverId },
      {
        senderId: receiverId,
        receiverId: senderId,
      },
    ],
  });
  if (isRequestExists) {
    const error = new CustomError("already sent the request ", 400);
    return next(error);
  }
  const newConnectionRequest = await ConnectionRequest.create({
    senderId,
    receiverId,
    status,
  });

  res.status(200).json({
    message: `${req.user.name} ${status} ${receiver.name}`,
    data: {
      newConnectionRequest,
    },
  });
});

export const connectionRequestReviewHanlder = aysncHandler(
  async (req, res, next) => {
    // validate the status
    const allowedStatus = ["accepted", "rejected"];
    const { status, requestId } = req.params;
    if (!allowedStatus.includes(status)) {
      res.status(400).json({ message: "invalid request status" });
    }

    // checking if request exsits
    // from the receiver perspective
    // vaidate user
    // status must be interested
    // request id should be valid
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      receiverId: req.user._id,
      status: "interested",
    });
    if (!connectionRequest) {
      const error = new CustomError("connection request not found");
      next(error);
    }

    // now after finding the request on the basis of rejection or acceptd we gotta save the request again
    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.status(200).json({ message: "connection request " + status, data });
  }
);
