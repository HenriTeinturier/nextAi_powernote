import { openai } from "@/lib/openai";
import type { ProcessAudioParams } from "./process-audio.schema";

export const getParamsText = async (params: ProcessAudioParams) => {
  if (params.text) {
    return params.text;
  }

  const audioFile = params.formData.get("audio") as File;

  const result = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });

  return result.text;
};
