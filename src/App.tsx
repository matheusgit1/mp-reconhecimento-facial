import * as React from "react";
import Header from "./components/Header";
// import LoadingSpinner from "./components/LoadingSpinner";
import * as faceapi from "face-api.js";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [expression, setExpression] = React.useState<{
    expression: string;
    probability: number;
  }>();
  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        const videoelement = videoRef.current;
        if (videoelement) {
          videoelement.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [videoRef]);

  React.useEffect(() => {
    Promise.all([
      faceapi.loadTinyFaceDetectorModel("/models"),
      faceapi.loadFaceLandmarkModel("/models"),
      faceapi.loadFaceExpressionModel("/models"),
    ])
      .then((_data) => {
        console.log("Models loaded");
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  async function handlerOnLoadedMetadata() {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (!videoElement || !canvasElement) return;

    const detections = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    // .withAgeAndGender();

    if (detections) {
      const dominantExpression = detections.expressions.asSortedArray()[0];
      setExpression(dominantExpression);

      const dimensions: faceapi.IDimensions = {
        width: videoElement?.offsetWidth,
        height: videoElement?.offsetHeight,
      };
      const resizedResults = faceapi.resizeResults(detections, {
        ...dimensions,
      });
      faceapi.matchDimensions(canvasElement, dimensions);
      faceapi.draw.drawDetections(canvasElement, resizedResults);
      // faceapi.draw.drawFaceLandmarks(canvasElement, resizedResults);
      faceapi.draw.drawFaceExpressions(canvasElement, resizedResults);
    }

    setTimeout(handlerOnLoadedMetadata, 50);
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row md:justify-between gap-14 xl:gap-40 p-10 items-center container mx-auto">
      {/* <Header /> */}
      <section className="flex flex-col gap-6 flex-1 w-full">
        <div className="bg-white rounded-xl p-2">
          <div className="relative flex items-center justify-center aspect-video w-full">
            {/* Substitua pela Webcam */}
            <div className="aspect-video rounded-lg bg-gray-300 w-full">
              <div className="relative flex w-full h-full aspect-video">
                <video
                  onLoadedMetadata={handlerOnLoadedMetadata}
                  autoPlay
                  ref={videoRef}
                  className="rounded aspect-video "
                ></video>
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                ></canvas>
              </div>
            </div>
            {/* Substitua pela Webcam */}
          </div>
        </div>
        {/* <div
          className={`bg-white rounded-xl px-8 py-6 flex gap-6 lg:gap-20 items-center h-[200px] justify-center`}
        >
          <p className="text-4xl text-center flex justify-center items-center text-yellow-300">
     
            <h1>sua expressão é {expression?.expression || ""}</h1>
             <LoadingSpinner />

          </p>
        </div> */}
      </section>
    </main>
  );
}

export default App;
