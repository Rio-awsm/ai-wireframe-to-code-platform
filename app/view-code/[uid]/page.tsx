"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import Constants from "@/data/Contants";
import { useEffect, useState } from "react";
import { Loader2, LoaderCircle } from "lucide-react";
import SelectionDetail from "../_components/SelectionDetail";
import CodeEditor from "../_components/CodeEditor";
import AppHeader from "@/app/_components/AppHeader";

export interface RECORD {
  id: number;
  description: string;
  code: any;
  imageUrl: string;
  model: string;
  createdBy: string;
  uid: string;
}

const ViewCode = () => {
  const { uid } = useParams();
  const [loading, setLoading] = useState(false);
  const [codeResp, setCodeResp] = useState("");
  const [record, setRecord] = useState<RECORD | null>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    uid && GetRecordInfo();
  }, [uid]);
  const GetRecordInfo = async () => {
    setIsReady(false);
    setCodeResp("");
    setLoading(true);
    const result = await axios.get("/api/wireframe-to-code?uid=" + uid);
    const resp = result?.data;
    setRecord(result?.data);
    if (resp?.code == null) {
      GenerateCode(resp);
    } else {
      setCodeResp(resp?.code?.resp);
      setLoading(false);
      setIsReady(true);
    }
    if (resp?.error) {
      console.log("No record found");
    }
    setLoading(false);
  };
  const GenerateCode = async (record: RECORD) => {
    setLoading(true);
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

      const text = decoder
        .decode(value)
        .replace("```jsx", "")
        .replace("```javascript", "")
        .replace("javascript", "")
        .replace("jsx", "")
        .replace("```", "");
      setCodeResp((prev) => prev + text);
    }
    setIsReady(true);
    setLoading(false);
    UpdateCOdeToDb();
  };

  useEffect(() => {
    if (codeResp != "" && record?.uid && isReady && record?.code == null) {
      UpdateCOdeToDb();
    }
  }, [codeResp && record && isReady]);

  const UpdateCOdeToDb = async () => {
    const result = await axios.put("/api/wireframe-to-code", {
      uid: record?.uid,
      codeResp: { resp: codeResp },
    });
    console.log(result);
  };

  return (
    <div>
      <AppHeader hideSidebar={true} />
      <div className="grid grid-cols-1 md:grid-cols-5 p-5 gap-10">
        <div>
          {/* Selection Details  */}
          <SelectionDetail
            record={record}
            isReady={isReady}
            regenrateCode={() => {
              GetRecordInfo();
            }}
          />
        </div>
        <div className="col-span-4">
          {/* Code Editor  */}
          {loading ? (
            <div>
              <h2
                className="font-bold text-2xl text-center p-20 flex items-center justify-center
                bg-slate-100 h-[80vh] rounded-xl
                "
              >
                {" "}
                <Loader2 className="animate-spin" /> Anaylzing the Wireframe...
              </h2>
            </div>
          ) : (
            <CodeEditor codeResp={codeResp} isReady={isReady} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCode;
