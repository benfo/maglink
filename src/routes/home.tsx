import { Checkbox, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { MagnetLink } from "../components/magnet-link";

function Home({ initialHash }: { initialHash?: string }) {
  const [state, setState] = useState({
    hash: initialHash || "",
    name: "",
    includeTrackers: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="mx-auto w-full max-w-md p-5">
      <h1 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-3xl lg:text-4xl dark:text-white">
        Magnet Link Generator
      </h1>
      <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400"></p>
      <div>
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="hash">Hash</Label>
            </div>
            <TextInput
              id="hash"
              name="hash"
              type="text"
              onChange={handleChange}
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="name">Name</Label>
            </div>
            <TextInput
              id="name"
              name="name"
              type="text"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="includeTrackers"
              name="includeTrackers"
              onChange={handleChange}
            />
            <Label htmlFor="includeTrackers">Add Trackers</Label>
          </div>

          <MagnetLink
            name={state.name}
            hash={state.hash}
            includeTrackers={state.includeTrackers}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
