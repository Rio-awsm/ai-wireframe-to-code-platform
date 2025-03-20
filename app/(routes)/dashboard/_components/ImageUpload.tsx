"use client";
import { Button } from "@/components/ui/button";
import Constants from "@/data/Contants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import uuid4 from "uuid4";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, Loader2Icon, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { ChangeEvent, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/configs/firebaseConfig";
import axios from "axios";
import { useAuthContext } from "@/app/provider";
import { useRouter } from "next/navigation";

const ImageUpload = () => {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuthContext();
  const [file, setFile] = useState<any>();
  const [model, setModel] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(imageUrl);
      setFile(files[0]);
    }
  };

  const onConvertToCodeButtonClick = async () => {
    if (!file || !model || !description) {
      return;
    }
    setLoading(true);
    //upload to firebase storage
    const fileName = Date.now() + ".png";
    const imageRef = ref(storage, "Wireframe_to_code/" + fileName);

    await uploadBytes(imageRef, file).then((resp) => {
      console.log("Image uploaded....");
    });
    const imageUrl = await getDownloadURL(imageRef);

    const uid = uuid4();

    //save info to db
    const result = await axios.post("/api/wireframe-to-code", {
      uid: uid,
      description: description,
      imageUrl: imageUrl,
      model: model,
      email: user?.email,
    });
    setLoading(false);
    router.push("/view-code/" + uid);
  };

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {!previewUrl ? (
          <div className="p-7 border border-dashed rounded-md shadow-md flex flex-col items-center justify-center">
            <CloudUpload className="h-10 w-10 text-primary" />
            <h2 className="font-bold text-lg">Upload Image</h2>

            <p className="text-gray-400 mt-3">
              Click Button to Select Wireframe Image
            </p>
            <div className="p-5 border border-dashed w-full flex justify-center mt-7">
              <label htmlFor="image-select">
                <h2 className="p-2 bg-blue-300 text-primary font-medium rounded-md px-5">
                  Select Image
                </h2>
              </label>
            </div>
            <input
              type="file"
              id="image-select"
              className="hidden"
              onChange={onImageSelect}
              multiple={false}
            />
          </div>
        ) : (
          <div className="p-5 border border-dashed">
            <Image
              src={previewUrl}
              alt="preview"
              width={500}
              height={500}
              className="w-full h-[300px] object-contain"
            />
            <X
              className="flex justify-end w-full cursor-pointer"
              onClick={() => setPreviewUrl(null)}
            />
          </div>
        )}

        <div className="p-7 border shadow-md rounded-lg">
          <h2 className="font-bold text-lg">Select AI Model</h2>
          <Select onValueChange={(value) => setModel(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {Constants?.AiModelList.map((model, index) => (
                <SelectItem value={model.name} key={index}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={model.icon}
                      alt={model.name}
                      width={25}
                      height={25}
                    />
                    <h2> {model.name}</h2>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <h2 className="font-bold text-lg">
            Enter description about your Webpage{" "}
          </h2>
          <Textarea
            onChange={(event) => setDescription(event?.target.value)}
            className="mt-3 h-[200px]"
            placeholder="Write about your webpage"
          />
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center">
        <Button onClick={onConvertToCodeButtonClick} disabled={loading}>
          {loading ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <WandSparkles />
          )}
          Convert to Code
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
