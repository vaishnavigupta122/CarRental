import express from "express";
import "dotenv/config"
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter  from "./routes/userRouter.js"
import ownerRouter from "./routes/ownerRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
//exprees app
const app = express()
///database
await connectDB()
//middleware
app.use(cors())
app.use(express.json())
////routes
app.use('/api/user',userRouter)

app.use('/api/owner',ownerRouter)

app.use('/api/bookings',bookingRouter)



app.get('/', (req, res) =>
    res.send("server running")
)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    console.log(`server is running on the port ${PORT}`)
)