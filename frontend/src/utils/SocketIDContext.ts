// import React, { createContext, useState, useContext } from "react";

// interface SocketContextType {
//   socketId: string | null;
//   setSocketId: React.Dispatch<React.SetStateAction<string | null>>;
// }

// const socketContext = createContext<SocketContextType | undefined>(undefined);

// export const useSocketID = () => {
//   const context = useContext(socketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within a SocketProvider");
//   }
//   return context;
// };

// export const SocketIdProvider: React.FC = ({ children }) => {};
