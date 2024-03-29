import { useMemo, useState, useEffect } from "react";
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
  const [selectedFiles, setSelectedFiles] = useState<File | null>();
  const [sharingLink, setSharingLink] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [roomUsers, setRoomUsers] = useState<any>([]);

  useEffect(() => {
    socket.on("fsBuffer", (data: any) => {
      console.log(data);
      if (data.option === true) {
        //call function start upload and send files in chunks
        uploadFile();
      }
    });
  }, []);

  // handle a file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const uniqueIdentifier = uuidv4(); // Implementing unique identifier generation logic
    if (file) {
      // calling shareFile function
      shareFileDetails(uniqueIdentifier, { name: file.name, size: file.size });
      // store file in a state
      setSelectedFiles(file);
      // generate a shareable link
      setSharingLink(`${window.location.origin}/share/${uniqueIdentifier}`);
    } else {
      console.log("no files detected");
    }
  };

  // share file metadata function to
  const shareFileDetails = async (uid: any, metadata: any) => {
    console.log(metadata);

    // create a room
    socket.emit("create-room", { uid });

    // check any other user in the room and show them file details
    socket.on("other-users", (data: any) => {
      setRoomUsers(data);
      // if there is a user in the room send the file metadata only
      if (data.length != 0) {
        console.log("users->", data);
        console.log(roomUsers);
        console.log("sending file data to users");
        socket.emit("file-meta", { uid, metadata });
      }
    });
  };

  //upload file function
  const uploadFile = () => {
    if (!selectedFiles) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const buffer = reader.result as ArrayBuffer;
      const fileSize = selectedFiles.size;
      let bytesSent = 0;

      const chunkSize = 1048576 * 3; // 3Mb chunk size

      socket.on("fsBuffer", () => {});

      const sendNextChunk = (offset: number) => {
        const chunk = buffer.slice(offset, offset + chunkSize);

        bytesSent += chunk.byteLength;
        setProgress((bytesSent / fileSize) * 100);

        if (bytesSent < fileSize) {
          setTimeout(() => {
            sendNextChunk(bytesSent);
          }, 100);
        } else {
          setProgress(100);
          console.log("File upload complete");
          socket.emit("endUpload");
        }
      };

      sendNextChunk(0);
    };

    reader.readAsArrayBuffer(selectedFiles);
  };

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
