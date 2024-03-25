import { useMemo, useState } from "react";
// import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";

const Home = () => {
  const socket = useMemo(() => io("http://localhost:5000"), []);
  // const handleSubmit = (e: any) => {
  //   e.preventDefault();
  //   console.log("creating room");
  //   // socket.emit("message", msg);
  // };

  // const [selectedFiles, setSelectedFiles] = useState<File>();
  const [selectedFiles, setSelectedFiles] = useState<File>();
  const [sharingLink, setSharingLink] = useState<string>("");

  const [roomUsers, setRoomUsers] = useState<any>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const uniqueIdentifier = uuidv4(); // Implement your own unique identifier generation logic
    if (file) {
      let reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as ArrayBuffer; // File data in ArrayBuffer format
        const uint8Array = new Uint8Array(result);

        shareFile(
          uniqueIdentifier,
          { name: file.name, size: uint8Array.length },
          uint8Array
        );
      };

      reader.readAsArrayBuffer(file);
    }

    // setSelectedFiles(files);
    const sharingLink = `${window.location.origin}/share/${uniqueIdentifier}`;

    setSharingLink(sharingLink);
  };

  const shareFile = async (uid: any, metadata: any, buffer: any) => {
    console.log(metadata);

    console.log(buffer);
    setSelectedFiles(metadata);
    socket.emit("create-room", { uid });
    socket.on("other-users", (data: any) => {
      setRoomUsers(data);
      if (data.length != 0) {
        console.log("users->", data);
        console.log(roomUsers);
        console.log("sending file data to users");
        socket.emit("file-meta", { uid, metadata, buffer });
      }
    });
  };

  //
  return (
    <div>
      <div className="p-5">
        <h1 className="text-3xl my-5">Welcome </h1>
        {/* <form onSubmit={handleSubmit}>
          <Link to={`/room/${uuidv4()}`}>
            {" "}
            <button
              type="submit"
              className="px-2 py-1 text-indigo-600 font-semibold uppercase rounded-md border-2 shadow-sm hover:scale-110 transition-all ease-in-out duration-300 hover:bg-indigo-600 hover:text-white"
            >
              create room
            </button>
          </Link>
        </form> */}

        <input type="file" onChange={handleFileChange} />

        {selectedFiles && (
          <div>
            {" "}
            <strong>Name:</strong> <p>{selectedFiles?.name}</p>
            <strong>Size:</strong>{" "}
            <p>{(selectedFiles?.size / (1024 * 1024)).toFixed(2)}mb</p>
          </div>
        )}

        {/* <button onClick={generateSharingLink}>Generate Sharing Link</button> */}
        {sharingLink && <p>Sharing Link: {sharingLink}</p>}
      </div>
    </div>
  );
};

export default Home;
