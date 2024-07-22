import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroups, updateGroup } from "../../store/groups";
import { useNavigate } from "react-router-dom";

export default function UpdateGroup({ group }) {
  const dispatch = useDispatch();
  const id = group.id;
  const userId = useSelector((state) => state.session.user.id);
  //CONTROL INPUT FOR LOCATION
  const [locationInput, setLocationInput] = useState(
    `${group.city},${group.state}`
  );
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);
    const parts = value.split(",").map((part) => part.trim());
    setLocation({
      city: parts[0],
      state: parts[1],
    });
  };
  const [location, setLocation] = useState({
    city: group.city,
    state: group.state,
  });
  //CONTROL INPUT FOR NAME AND OTHERS
  const [name, setName] = useState(group.name);
  const [about, setAbout] = useState(group.about);
  const [type, setType] = useState(group.type);
  const [privateState, setPrivateState] = useState(group.private);
  const [previewImage, setPreviewImage] = useState(group.previewImage);
  const [validation, setValidation] = useState({});

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();// it prevents the default form submission behavior, which reloads the page and stops the React component from handling the form submission as intended.
    const userInput = {
      organizerId: userId,
      city: location.city,
      state: location.state,
      name,
      about,
      type,
      privateState,
      previewImage,
    };
    return await dispatch(updateGroup(userInput, id))
      .then((response) => {
        const id = response.id;
        dispatch(getAllGroups())
        navigate(`/allgroups/${id}`);
      })
      .catch(
        //catch will get the return value of Promise.reject(err)
        async (response) => {
          console.log("update err message", response);
          if (response.errors) {
            const err = response.errors;
            setValidation(err);
          }
        }
      );
  };
  //FOR IMAGE
  const handleImageChange = (e) => {
    const value = e.target.value;
    setPreviewImage([value])
    // setPreviewImage((prev)=>[value,...prev])
  }
  return (
    <form onSubmit={handleSubmit}>
      <p>BECOME AN ORGANIZER</p>
      <h4>
        We will walk you through a few steps to build your local community
      </h4>
      <hr></hr>
      <h4>First, set your group&apos;s location</h4>
      <p>
        Meetup groups meet locally, in person and online. We&apos;ll connect you with
        people in your area, and more can join you online
      </p>
      {validation.city && <div>{validation.city}</div>}
      {validation.state && <div>{validation.state}</div>}
      <label htmlFor="location">
        <input
          id="location"
          placeholder="City, STATE"
          value={locationInput}
          onChange={handleLocationChange}
          name="location"
        />
      </label>
      <hr></hr>
      <h4>What will your group&apos;s name be?</h4>
      <p>
        Choose a name that will give people a clear idea of what the group is
        about. Feel free to get creative! You can edit this later if you change
        your mind
      </p>
      {validation.name && <div>{validation.name}</div>}
      <label htmlFor="name">
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <hr></hr>
      <h4>Now describe what your group will be about</h4>
      <p>
        People will see this when we promote your group, but you&apos;ll be able to
        add to it later, too.
      </p>
      <p> 1. What &apos;s the purpose of the group?</p>
      <p>2. Who should join?</p>
      <p>3. What will you do at your events?</p>
      {validation.about && <div>{validation.about}</div>}
      <textarea
        htmlFor="about"
        id="about"
        name="about"
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        placeholder="Please write at least 30 characters"
      />
      <hr></hr>
      <h4>Final steps...</h4>
      <h5>Is this an in person or online group?</h5>
      {validation.type && <div>{validation.type}</div>}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">select one</option>
        <option value="In person">In person</option>
        <option value="Online">Online</option>
      </select>
      <h5>Is this group private or public</h5>
      <select
        value={privateState}
        onChange={(e) => setPrivateState(e.target.value)}
      >
        <option value="">select one</option>
        <option value={false}>Public</option>
        <option value={true}>Private</option>
      </select>
      <h5>Please add an image url for your group below</h5>
      {/* {validation.url && <div>{validation.url}</div>} */}
      <input
        value={previewImage && previewImage[0]}
        // onChange={(e) => setPreviewImage(e.target.value)}
        onChange={handleImageChange}
        placeholder="Image Url"
      ></input>
      <hr></hr>
      <button type="submit">Confirm changes</button>
    </form>
  );
}
