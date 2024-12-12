const FLOAT16_API_URL =
  'https://api.float16.cloud/dedicate/78y8fJLuzE/v1/chat/completions'
const FLOAT16_API_KEY = process.env.FLOAT16_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { text } = req.body

    const prompt = `ช่วยปรับปรุงข้อความต่อไปนี้ให้เป็นภาษาไทยที่เป็นธรรมชาติและลื่นไหลมากขึ้น 
    โดยรักษาความหมายและระดับความเป็นทางการเดิมไว้:

    ${text}

    ข้อความที่ปรับปรุงแล้ว:`

    const response = await fetch(FLOAT16_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FLOAT16_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openthaigpt/openthaigpt1.5-7b-instruct',
        messages: [
          {
            role: 'system',
            content:
              'คุณคือผู้ช่วยตอบคำถามที่ฉลาดและซื่อสัตย์ ที่เชี่ยวชาญในการปรับปรุงภาษาไทยให้เป็นธรรมชาติ'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const data = await response.json()
    const enhancedText = data.choices?.[0]?.message?.content || text

    res.status(200).json({ enhancedText })
  } catch (error) {
    console.error('Thai enhancement error:', error)
    res.status(500).json({
      message: 'Enhancement failed',
      error: error.message
    })
  }
}
