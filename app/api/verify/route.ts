import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

const ABI = [
    "function balanceOf(address account, uint256 id) public view returns (uint256)"
]

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const wallet = searchParams.get('wallet')
        const tokenIdStr = searchParams.get('tokenId')

        if (!wallet || !tokenIdStr) {
            return NextResponse.json({ error: 'Missing wallet or tokenId' }, { status: 400 })
        }

        const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
        // Usamos nuestro RPC de Alchemy para leer la red Sepolia sin costo
        const providerUrl = process.env.ALCHEMY_API_KEY ?
            `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` :
            'https://rpc.sepolia.org' // Fallback público

        const provider = new ethers.JsonRpcProvider(providerUrl)
        const contract = new ethers.Contract(contractAddress!, ABI, provider)

        console.log(`[Verify API] Lectura de token ${tokenIdStr} para wallet ${wallet}`)
        const balance = await contract.balanceOf(wallet, tokenIdStr)
        console.log(`[Verify API] Balance:`, balance.toString())

        return NextResponse.json({
            isVerified: balance.toString() !== "0"
        })
    } catch (err) {
        console.error("Verification API Error:", err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
