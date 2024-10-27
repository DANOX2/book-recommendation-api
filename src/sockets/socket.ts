const socketHandler = (io: any) => {
    io.on("connection", (socket: any) => {
        console.log("New client connected");

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });
};

export default socketHandler;
