import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const Room = () => {
  const params = useParams();
  const socket = useMemo(() => io("http://localhost:5000"), []);
  // const [socketId, setSocketId] = useState<String | any>("");
  const [roomUsers, setRoomUsers] = useState<any>([]);

  const [fileBuffer, setFileBuffer] = useState<File | null>(null);

  useEffect(() => {
    // socket.on("connect", () => {
    //   console.log("connected->" + socket.id);
    //   setSocketId(socket.id);
    //   console.log("room id is->",socketId)
    // });
    if (params.roomID !== null || params.roomID != "") {
      socket.emit("join-room", params.roomID);
    }
    socket.on("receive", (data) => {
      console.log(data);
    });
    // socket.on("user-count", (data: any) => {
    //   console.log("user count->", data);
    // });
    socket.on("other-users", (data: any) => {
      console.log("users->", data);
      setRoomUsers(data);
    });

    socket.on("fs-meta", (data: any) => {
      console.log(data);
      setFileBuffer(bufferToFile(data.buffer, data.metadata.name));
    });
  }, []);

  const bufferToFile = (buffer: any, fileName: any) => {
    // Create a Blob object from the buffer data
    const blob = new Blob([buffer]);

    // Construct a File object from the Blob
    const file = new File([blob], fileName);

    return file;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        socket.emit("fileBuffer", { room: params.roomID, buffer });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const downloadFile = () => {
    if (fileBuffer) {
      const url = URL.createObjectURL(fileBuffer);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileBuffer.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  if (fileBuffer) console.log(fileBuffer);
  return (
    <section>
      This is Room No. {params.roomID}
      <div>
        {!roomUsers.length ? (
          <h2>waiting for other users to join......</h2>
        ) : (
          <div>
            <input type="file" onChange={handleFileChange} />
            {fileBuffer && (
              <div>
                <h2>File Data</h2>
                <p>File Name: {fileBuffer?.name}</p>
                <p>
                  File Size: {(fileBuffer?.size / (1024 * 1024)).toFixed(2)} mb
                </p>
                <button onClick={downloadFile}>Download File</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Room;
