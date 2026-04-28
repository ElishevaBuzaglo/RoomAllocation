import { Route, Routes } from "react-router"
import Home from "../components/Home"
import RoomsList from "../components/RoomsList"
import { Nav } from "./Nav"
import RoomSchedule from "../components/RoomSchedule"

export const Routing = () => {
    return <>
        <Routes>
            <Route path="home" element={<Home></Home>}></Route>
            <Route path="roomList" element={<RoomsList></RoomsList>}></Route>
            <Route path="roomSchedule" element={<RoomSchedule></RoomSchedule>}></Route>
        </Routes>
    </>
}