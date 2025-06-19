const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const shareStore = {};

const PORT = 3000;

app.post('/share', (req, res) => {
    const { ipfsHash, middlemanShare } = req.body;

    if (!ipfsHash || !middlemanShare) {
        return res.status(400).json({ error: 'ipfsHash and middlemanShare are required' });
    }

    shareStore[ipfsHash] = middlemanShare;
    console.log(`Stored share for ${ipfsHash}`);
    res.status(200).json({ success: true, message: `Share for ${ipfsHash} stored.` });
});

app.get('/share/:ipfsHash', (req, res) => {
    const { ipfsHash } = req.params;
    const share = shareStore[ipfsHash];

    if (share) {
        console.log(`Retrieved share for ${ipfsHash}`);
        res.status(200).json({ success: true, middlemanShare: share });
    } else {
        console.log(`No share found for ${ipfsHash}`);
        res.status(404).json({ success: false, error: 'Share not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Middleman server listening on http://localhost:${PORT}`);
});
