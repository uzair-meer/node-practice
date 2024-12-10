import mongoose from "mongoose";

const ConnectionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referece to user collection
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is not defined`,
      },
    },
  },
  {
    timestamps: true,
  }
);

ConnectionSchema.index({ senderId: 1, receiverId: 1 });
ConnectionSchema.pre("save", function () {
  const connectionRequest = this;
  // checking if
  if (connectionRequest.senderId.equals(connectionRequest.receiverId)) {
    throw new Error("cannot send request to yourself");

    next();
  }
});
const ConnectionRequest = mongoose.model("connectionRequest", ConnectionSchema);

export default ConnectionRequest;
