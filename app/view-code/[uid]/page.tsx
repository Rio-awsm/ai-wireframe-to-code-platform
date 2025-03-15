"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import Constants from "@/data/Contants";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

interface RECORD {
  id: number;
  description: string;
  code: any;
  imageUrl: string;
  model: string;
  createdBy: string;
}

const ViewCode = () => {
  const { uid } = useParams();
  const [loading, setLoading] = useState(false)
  const [codeResp, setCodeResp] = useState('')

  useEffect(() => {
    uid && GetRecordInfo();
  }, [uid]);
  const GetRecordInfo = async () => {
    setLoading(true)
    const result = await axios.get("/api/wireframe-to-code?uid=" + uid);
    const resp = result?.data;
    if (resp?.code == null) {
      GenerateCode(resp);
    }
    if (resp?.error) {
      console.log("No record found");
    }
    setLoading(false)
  };
  const GenerateCode = async (record: RECORD) => {
    setLoading(true)
    const res = await fetch("/api/ai-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: record?.description + ":" + Constants.PROMPT,
        model: record.model,
        imageUrl: record?.imageUrl,
      }),
    });
    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = (decoder.decode(value)).replace('```jsx', '').replace('```javascript', '').replace('javascript', '').replace('jsx', '').replace('```', '');
      setCodeResp((prev) => prev +  text)
    }
    setLoading(false)
  };
  return (
    <div>
      {loading && <LoaderCircle className="animate-spin" />}
      <p>{codeResp}</p>
    </div>
  );
};

export default ViewCode;
