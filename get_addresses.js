
async function getStorage(slot) {
    const res = await fetch("https://aeneid.storyrpc.io", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getStorageAt",
            params: ["0xe0Fb8E67E83d69d198e90d101D2890F8E3631F72", slot, "latest"],
            id: 1
        })
    });
    const data = await res.json();
    return "0x" + data.result.slice(-40); // Address is last 40 chars of the 32-byte slot
}

async function main() {
    console.log("NEXT_PUBLIC_MIRROR_MATCHER_ADDR=" + await getStorage("0x0"));
    console.log("NEXT_PUBLIC_STAGED_READ_CONDITION_ADDR=" + await getStorage("0x1"));
    console.log("NEXT_PUBLIC_MIRROR_NDA_ADDR=" + await getStorage("0x2"));
    console.log("NEXT_PUBLIC_NEGOTIATION_RIGHTS_ADDR=" + await getStorage("0x3"));
    console.log("NEXT_PUBLIC_OWNER_WRITE_CONDITION_ADDR=" + await getStorage("0x4"));
}
main();
