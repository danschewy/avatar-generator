import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const prediction = await replicate.predictions.create({
    // Pinned to a specific version of Stable Diffusion
    // See https://replicate.com/stability-ai/sdxl
    version: "ba5ab694a9df055fa469e55eeab162cc288039da0abd8b19d956980cc3b49f6d",

    // This is the text prompt that will be submitted by a form on the frontend
    input: {
      image: req.body.dad,
      steps: 25,
      width: 512,
      gender: req.body.gender,
      height: 728,
      image2: req.body.mom,
    },
  });

  if (prediction?.error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: prediction.error }));
    return;
  }

  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}
