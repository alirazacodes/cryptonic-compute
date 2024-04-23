import multer from 'multer';
import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import nextConnect from 'next-connect';

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const upload = multer({ dest: 'uploads/' }); 

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileStream = fs.createReadStream(req.file.path);
    const options = {
      pinataMetadata: {
        name: req.file.originalname,
        keyvalues: {
          customKey: "customValue"
        }
      },
      pinataOptions: {
        cidVersion: 1,
        wrapWithDirectory: false
      }
    };
    const result = await pinata.pinFileToIPFS(fileStream, options);
    fs.unlinkSync(req.file.path); 
    res.status(200).json({ IpfsHash: result.IpfsHash });
  } catch (error) {
    console.error('Pinata Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS', details: error.message });
  }
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;
