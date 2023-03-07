import React, {useEffect, useState} from "react";


export enum VideoFacingMode {
    'user' = 'user',
    'environment' = 'environment',
    'left' = 'left',
    'right' = 'right',
    switchFromBtn = 'switchFrontBtn',
    switchBackBtn = 'switchBackBtn',
    snapBtn = 'snapBtn'
}


export const TakePictureComponent = () => {
    const [mediaStreamConstraints, setMediaStreamConstraints] = useState<MediaStreamConstraints>(() => ({
            audio: false,
            video: {
                width: {ideal: 640},
                height: {ideal: 480},
                facingMode: "environment"
            }
        })
    );
    const [mediaStream, setMediaStream] = useState<MediaStream | null >(null)
    useEffect(() => {
// Prefer camera resolution nearest to 1280x720.

        async function getMediaStream(constraints: MediaStreamConstraints) {
            try {
                // mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                const video = document.getElementById('cam');
                // video.srcObject = mediaStream;
                // video.onloadedmetadata = (event) => {
                //    video.play();
                // };
            } catch (err) {
                // console.error(err.message);
            }
        };

        async function switchCamera(cameraMode: VideoFacingMode) {
            try {
                // stop the current video stream
                if (mediaStream != null && mediaStream.active) {
                    const tracks = mediaStream.getVideoTracks();
                    tracks.forEach(track => {
                        track.stop();
                    })
                }

                // set the video source to null
                // document.getElementById('cam').srcObject = null;

                // change "facingMode"
                // mediaStreamConstraints.video.facingMode = cameraMode;

                // get new media stream
                await getMediaStream(mediaStreamConstraints);
            } catch (err) {
                // console.error(err.message);
                // alert(err.message);
            }
        }

        function takePicture() {
            const canvas = document.getElementById('canvas') as HTMLCanvasElement;
            const video = document.getElementById('cam') as HTMLVideoElement;
            const photo = document.getElementById('photo') as HTMLPictureElement;
            const context = canvas.getContext('2d');

            const height = video.videoHeight;
            const width = video.videoWidth;

            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                // context.drawImage(video, 0, 0, width, height);
                const data = canvas.toDataURL('image/png');
                photo.setAttribute('src', data);
            } else {
                // clearphoto();
            }
        }

        function clearPhoto() {
            const canvas = document.getElementById('canvas');
            const photo = document.getElementById('photo');
/*
            const context = canvas.getContext('2d');

            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
*/
        }

/*
        document.getElementById('switchFrontBtn').onclick = (event) => {
            switchCamera("user");
        }

        document.getElementById('switchBackBtn').onclick = (event) => {
            switchCamera("environment");
        }

        document.getElementById('snapBtn').onclick = (event) => {
            takePicture();
            event.preventDefault();
        }
*/

        clearPhoto();
    }, [])
    return <div>
        <div>
            <button id="switchFrontBtn">Front Camera</button>
            <button id="switchBackBtn">Back Camera</button>
            <button id="snapBtn">Snap</button>
        </div>
        <div style={{width: '100%'}}>
            {/*add autoplay muted playsinline for iOS */}
            <video id="cam" autoPlay muted playsInline>Not available</video>
            <canvas id="canvas" style={{display: 'none'}}></canvas>
            <img id="photo" alt="The screen capture will appear in this box."/>
        </div>
    </div>;
}
async function convertHeicToJpeg(file: File): Promise<File> {
    // Load the HEIC image as an image element
    const image = new Image();
    const imageLoadPromise = new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.src = URL.createObjectURL(file);
    });
    await imageLoadPromise;

    // Draw the image onto a canvas
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(image, 0, 0);

    // Convert the canvas to a JPEG blob
    const jpegBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9)
    );

    // Create a new File object with the JPEG blob and the original filename
    const jpegFile = new File([jpegBlob], file.name.replace(/\.heic$/, '.jpg'), {
        type: 'image/jpeg',
    });
    return jpegFile;
}


interface CameraComponentProps {
    onPictureTaken: (image: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onPictureTaken }) => {
    const [image, setImage] = useState<string>();

    const handlePictureTaken = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageString = reader.result as string;
                setImage(imageString);
                onPictureTaken(imageString);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div> <input type="file" accept="image/*" capture="environment" onChange={handlePictureTaken} />
            {image && <img src={image} alt="Taken Picture" />}
        </div>
    );
};

export default CameraComponent;
