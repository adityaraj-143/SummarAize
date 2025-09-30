import { getPineconeClient } from "./pinecone";
import { getEmbeddings } from "./embeddings";

export async function getContext (query: string, filekey:string) {
    const queryEmbeddings = await getEmbeddings([query])
    console.log("queryEmbeddings: ",queryEmbeddings)
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, filekey)

    console.log(matches)

    const qualifyingDocs = matches?.filter((match) => match.score && match.score > 0.5)

    type Metadata = {
        text:string
        pageNumber: number
    }

    let docs = qualifyingDocs?.map(match => (match.metadata as Metadata).text)

    return docs?.join('\n').substring(0, 3000)
}

export async function getMatchesFromEmbeddings(embeddings: number[][], filekey: string) {
    const pc = getPineconeClient()

    const pcIndex = pc.index("summaraize", process.env.PINECONE_HOST);
    try {
        const queryResult = await pcIndex.namespace(filekey).query({
            topK: 5,
            vector: embeddings[0],
            includeMetadata:true,
            
        })

        return queryResult.matches || []
    } catch (error) {
        console.log('Error quering embeddings: ',error)
    }
}