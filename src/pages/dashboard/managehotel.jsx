import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  Input,
  Dialog,
  Radio,
  Switch,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Tooltip,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  HomeModernIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";

export function ManageHotel() {
  const [hotels, setHotels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageUrls, setImageUrls] = useState([""]);
  const [openViewDialog, setOpenViewDialog] = useState(false); // State for view dialog
  const [currentHotel, setCurrentHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    locationId: "",
    about: "",
    facilities: [],
    externalBookingLink: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [hotelName, setHotelName] = useState("");
  const [mode, setMode] = useState("manual");
  const [inputValue, setInputValue] = useState(formData.locationId || "");

  useEffect(() => {
    setInputValue(formData.locationId || "");
  }, [formData.locationId]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (mode === "url") {
      const match = val.match(/-d(\d+)/);
      const extracted = match ? match[1] : "";
      setFormData({ ...formData, locationId: extracted });
    } else {
      if (/^\d*$/.test(val)) {
        setFormData({ ...formData, locationId: val });
      }
    }
  };

  const toggleMode = () => {
    const newMode = mode === "manual" ? "url" : "manual";
    setMode(newMode);
    setInputValue(newMode === "manual" ? formData.locationId || "" : "");
    if (newMode === "url") {
      setFormData({ ...formData, locationId: "" });
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrls.length < 6) {
      // Check if the current length is less than 6
      setImageUrls([...imageUrls, ""]); // Add a new empty string to the array
    }
  };

  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value; // Update the specific index with the new value
    setImageUrls(updatedUrls);
  };

  const handleRemoveImageUrl = (index) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index); // Remove the URL at the specified index
    setImageUrls(updatedUrls);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get("/hotels");
      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setAlert({ message: "Error fetching hotels", type: "red" });
    }
  };

  const handleOpenDialog = (hotel = null) => {
    setCurrentHotel(hotel);
    setFormData(
      hotel
        ? {
            name: hotel.name,
            location: hotel.location,
            locationId: hotel.locationId,
            about: hotel.about,
            facilities: hotel.facilities,
            externalBookingLink: hotel.externalBookingLink,
            images: hotel.images,
          }
        : {
            name: "",
            location: "",
            locationId: "",
            about: "",
            facilities: [],
            externalBookingLink: "",
            images: [],
          },
    );
    setImageUrls(hotel ? hotel.images : [""]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentHotel(null);
    setAlert({ message: "", type: "" });
  };

  const handleViewHotel = (hotel) => {
    setCurrentHotel(hotel);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setCurrentHotel(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        images: imageUrls.filter((url) => url.trim() !== ""), // Filter out empty URLs
      };
      if (currentHotel) {
        await axios.put(`/hotels/${currentHotel._id}`, dataToSubmit);
        setAlert({ message: "Hotel updated successfully!", type: "green" });
      } else {
        await axios.post("/hotels", dataToSubmit);
        setAlert({ message: "Hotel added successfully!", type: "green" });
      }
      fetchHotels();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving hotel:", error);
      setAlert({ message: "Error saving hotel", type: "red" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setHotelName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/hotels/${id}`);
      setAlert({ message: "Hotel deleted successfully!", type: "green" });
      fetchHotels();
    } catch (error) {
      console.error("Error deleting hotel:", error);
      setAlert({ message: "Error deleting hotel", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden px-4 py-6">
      {alert.message && (
        <Alert
          color={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleOpenDialog()} color="blue">
          Add Hotel
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {hotels.map((hotel) => (
            <Card
              key={hotel._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    color="deep-orange"
                    className="flex items-center justify-start gap-2"
                  >
                    <HomeModernIcon strokeWidth={2} className="h-5 w-5" />
                    {hotel.name}
                  </Typography>
                  <Typography className="mt-1 font-medium text-blue-500">
                    {hotel.location}
                  </Typography>
                </div>

                <div className="flex items-center gap-4">
                  <Tooltip
                    content="View"
                    placement="top"
                    className="font-medium text-blue-600"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      variant="text"
                      color="blue"
                      onClick={() => handleViewHotel(hotel)}
                      className="p-2"
                    >
                      <EyeIcon strokeWidth={2} className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Edit"
                    placement="top"
                    className="font-medium text-green-600"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      variant="text"
                      color="green"
                      onClick={() => handleOpenDialog(hotel)}
                      className="p-2"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Delete"
                    placement="top"
                    className="font-medium text-red-500"
                    color="red"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      variant="text"
                      color="red"
                      onClick={() => confirmDelete(hotel._id, hotel.name)}
                      className="p-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Add/Edit Hotel Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>{currentHotel ? "Edit Hotel" : "Add Hotel"}</DialogHeader>
        <DialogBody className="h-[480px] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Hotel Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
            {/* <Input
              label="Location ID"
              value={formData.locationId}
              onChange={(e) =>
                setFormData({ ...formData, locationId: e.target.value })
              }
              required
            /> */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Manual
                </span>
                <Switch
                  id="custom-switch-component"
                  checked={mode === "url"}
                  onChange={toggleMode}
                  ripple={false}
                  className="h-full w-full checked:bg-blue-500"
                  containerProps={{ className: "w-11 h-6" }}
                  circleProps={{
                    className: "before:hidden left-0.5 border-none",
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  From URL
                </span>
              </div>

              <Input
                label={
                  mode === "url" ? "TripAdvisor URL" : "Manual Location ID"
                }
                value={inputValue}
                onChange={handleInputChange}
                required
              />
            </div>
            <Input
              label="About"
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
            />
            <Typography variant="h6">Facilities</Typography>
            {formData.facilities.map((facility, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <Input
                  label={`Facility ${index + 1}`}
                  value={facility}
                  onChange={(e) => {
                    const updated = [...formData.facilities];
                    updated[index] = e.target.value;
                    setFormData({ ...formData, facilities: updated });
                  }}
                  className="flex-1"
                />
                {formData.facilities.length > 1 && (
                  <Button
                    size="sm"
                    color="red"
                    onClick={() => {
                      const updated = formData.facilities.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, facilities: updated });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}

            <Button
              size="sm"
              color="blue"
              onClick={() =>
                setFormData({
                  ...formData,
                  facilities: [...formData.facilities, ""],
                })
              }
            >
              + Add Facility
            </Button>
            <Input
              label="External Booking Link"
              value={formData.externalBookingLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  externalBookingLink: e.target.value,
                })
              }
            />
            <div>
              <Typography variant="h6">Images</Typography>
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="mt-2 flex items-center justify-center space-x-2"
                >
                  <Input
                    label={`Image URL ${index + 1}`}
                    value={url}
                    onChange={(e) =>
                      handleImageUrlChange(index, e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    color="red"
                    onClick={() => handleRemoveImageUrl(index)}
                    variant="text"
                    className="p-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                color="blue"
                onClick={handleAddImageUrl}
                className="mt-2"
                disabled={imageUrls.length >= 6}
              >
                Add Another Image URL
              </Button>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCloseDialog} color="red" variant="text">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="green" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Hotel Dialog */}
      <Dialog open={openViewDialog} handler={handleCloseViewDialog} size="md">
        <DialogHeader className="flex items-start justify-between">
          <Typography variant="h5" className="flex items-center gap-2">
            <HomeModernIcon className="h-6 w-6 text-blue-500" />
            {currentHotel ? currentHotel.name : "Hotel Details"}
          </Typography>
          <div className="flex gap-2">
            <Tooltip
              content="Edit"
              placement="left"
              className="z-[50000] font-medium text-green-600"
            >
              <Button
                variant="text"
                className="p-2"
                color="green"
                onClick={() => {
                  handleOpenDialog(currentHotel);
                  handleCloseViewDialog();
                }}
                title="Edit"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Delete"
              placement="top"
              className="z-[50000] font-medium text-red-600"
            >
              <Button
                variant="text"
                className="p-2"
                color="red"
                onClick={() =>
                  confirmDelete(currentHotel._id, currentHotel.name)
                }
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Close"
              placement="right"
              className="z-[50000] font-medium text-purple-600"
            >
              <Button
                variant="text"
                className="p-2"
                color="purple"
                onClick={handleCloseViewDialog}
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[80vh] space-y-4 overflow-y-auto px-4">
          {currentHotel && (
            <div className="space-y-4">
              <Typography variant="h5" color="orange">
                📍 Location:
              </Typography>
              <Typography color="black" variant="h6" className="pl-2">
                {currentHotel.location}
              </Typography>

              <Typography variant="h5" color="orange">
                🆔 Location ID:
              </Typography>
              <Typography
                color="black"
                variant="h6"
                className="ml-8 w-fit rounded-md bg-blue-200 px-2 py-1 pl-2"
              >
                {currentHotel.locationId}
              </Typography>

              <Typography variant="h5" color="orange">
                ℹ️ About:
              </Typography>
              <Typography
                color="black"
                variant="h6"
                className="pl-2 text-justify"
              >
                {currentHotel.about}
              </Typography>

              <Typography variant="h5" color="orange">
                🏅 TripAdvisor:
              </Typography>
              <Typography color="black" variant="h6" className="pl-2">
                ⭐ {currentHotel.tripAdvisorRating} / 5 from{" "}
                {currentHotel.tripAdvisorReviews} reviews
              </Typography>

              <Typography variant="h5" color="orange">
                🎯 Facilities:
              </Typography>
              <ul className="text-md list-disc pl-6 font-semibold text-black">
                {currentHotel.facilities.map((facility, i) => (
                  <li key={i}>{facility}</li>
                ))}
              </ul>

              <Typography variant="h5" color="orange">
                🔗 External Booking:
              </Typography>
              <a
                href={currentHotel.externalBookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block pl-2 text-blue-500 underline"
              >
                {currentHotel.externalBookingLink}
              </a>

              <Typography variant="h5" color="orange">
                🖼️ Images:
              </Typography>
              <div className="flex flex-wrap gap-2 pl-2">
                {currentHotel.images
                  .concat(currentHotel.tripAdvisorPhotos || [])
                  .map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Hotel Image ${i + 1}`}
                      className="h-20 w-20 rounded border object-cover"
                    />
                  ))}
              </div>

              <Typography variant="h5" color="orange">
                🛏️ Room Types:
              </Typography>
              <ul className="text-md list-disc pl-6 font-semibold text-black">
                {currentHotel.rooms.map((room) => (
                  <li key={room._id}>
                    {room.numberofrooms} rooms for up to {room.guestCapacity}{" "}
                    guests
                  </li>
                ))}
              </ul>

              <Typography variant="h5" color="orange">
                📝 Latest Reviews:
              </Typography>
              <div className="space-y-3 pl-2">
                {currentHotel.tripAdvisorLatestReviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded border border-gray-200 p-2 shadow-sm"
                  >
                    <Typography className="mb-1 w-fit rounded-lg bg-black/90 px-2 py-1 text-sm text-yellow-500">
                      ⭐ {review.rating} / 5
                    </Typography>
                    <Typography className="whitespace-pre-line text-sm text-black">
                      {review.review}
                    </Typography>
                  </div>
                ))}
              </div>

              <Typography variant="h5" color="orange">
                🌐 TripAdvisor Profile:
              </Typography>
              <a
                href={currentHotel.tripAdvisorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block pl-2 text-blue-500 underline"
              >
                {currentHotel.tripAdvisorLink}
              </a>
            </div>
          )}
        </DialogBody>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={setOpenDeleteDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{hotelName}</span>?
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDelete(deleteId)}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ManageHotel;
