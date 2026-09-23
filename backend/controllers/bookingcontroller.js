import Booking from "../models/Booking.js"
import Car from "../models/Car.js"
////finction check avaliblity of car for given date
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        pickupDate: {
            $lte: returnDate,
        },
        returnDate: {
            $gte: pickupDate
        }
    })
    return bookings.length === 0
}
//appi to check avalibality of cars for given date and location]

export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const { location, pickupDate, returnDate } = req.body
        //fetch all avilable cars for the givnen location

        const cars = await Car.find({
            location,
            isAvaliable: true
        })
        //check car available for the given date range using promise
        const availableCarPromises = cars.map(async (car) => {
            const isAvaliable = await checkAvailability(
                car._id,
                pickupDate,
                returnDate
            )
            return {
                ...car._doc,
                isAvaliable: isAvaliable,
            }
        })

        let availableCars = await Promise.all(availableCarPromises);
        availableCars = availableCars.filter(car => car.isAvaliable === true)
        res.json({
            success: true,
            availableCars
        })
    }
    catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}

//adi to create booking
export const createBooking = async (req, res) => {
    try {
        const { _id } = req.user
        const { car, pickupDate, returnDate } = req.body

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)

        if (!isAvailable) {
            return res.json({
                success: false,
                message: "car is not available from selected date"
            })


        }
        const carData = await Car.findById(car)

        console.log("CAR ID:", car)
console.log("CAR OWNER:", carData.owner)
console.log("USER ID:", _id)
        //calculate price based on pickupdate and return data

        const picked = new Date(pickupDate)
        const returned = new Date(returnDate)
        const noOfDays = Math.ceil((
            returned - picked
        ) /
            (1000 * 60 * 60 * 24)
        )
        const price = carData.pricePerDay * noOfDays

        await Booking.create({
            car,
            owner: carData.owner,
            user: _id,
            pickupDate,
            returnDate,
            price
        })
        res.json({
            success: true,
            message: "Booking Created"
        })

    }
    catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}
///////api to list user booking
export const getUserBookings = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({
            user: _id
        }).populate("car").sort({ createdAt: -1 })
        res.json({
            success: true,
            bookings
        })
    }
    catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}
////api to get owner bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.json({
                success: false,
                message: "unauthorized"
            })
        }
        const bookings = await Booking.find({
            owner: req.user._id
        }).populate('car user').select("-user.password").sort({ createdAt: -1 })
        res.json({
            success: true,
            bookings
        })
    }
    catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}
////apt to change booking status
export const changeBookingsStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId, status } = req.body

        const booking = await Booking.findById(bookingId)

        if (booking.owner.toString() !== _id.toString()) {
            res.json({
                success: false,
                message:"Unauthorized"
            })
        }

        booking.status=status;
        await booking.save()
          res.json({
            success: true,
            message:"status updated"
        })

    }
    catch (error) {
        console.log(error.message)
        res.json({
            success: false,
            message: error.message
        })
    }
}