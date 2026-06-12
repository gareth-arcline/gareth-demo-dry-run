import { v4 as uuidv4 } from 'uuid'

const TOPIC_TEMPLATES = [
  "Company Overview & Background",
  "Market Position & Competitive Landscape",
  "Management Team Assessment",
  "Financial Performance Summary",
  "Operational Highlights & Capabilities",
  "Key Risks & Mitigation Strategies",
  "Growth Strategy & Expansion Plans",
  "Customer & Revenue Analysis",
  "Technology & Innovation Pipeline",
  "Next Steps & Action Items",
  "Regulatory & Compliance Considerations",
  "Supply Chain & Logistics Review",
  "Talent & Organizational Structure",
  "Capital Expenditure & Investment Plans",
]

const SUB_TOPIC_TEMPLATES = [
  "Revenue breakdown by segment and geography",
  "Year-over-year growth trends and projections",
  "Key customer concentration and retention metrics",
  "Competitive advantages and differentiation factors",
  "Management experience and track record",
  "Margin analysis and cost optimization opportunities",
  "Market size and addressable opportunity",
  "Product roadmap and development milestones",
  "Workforce composition and hiring plans",
  "Debt structure and capital allocation strategy",
  "Integration synergies and operational efficiencies",
  "Environmental and sustainability initiatives",
  "Partnership and channel strategy",
  "Quality control and compliance frameworks",
  "Brand positioning and marketing effectiveness",
  "Working capital and cash flow dynamics",
  "Site visit observations and facility assessment",
  "Customer feedback and satisfaction metrics",
  "Pricing strategy and competitive benchmarking",
  "IT infrastructure and digital transformation progress",
]

const LOREM_PARAGRAPHS = [
  "The team conducted a thorough review of the operational metrics and identified several areas where performance has exceeded initial expectations. Revenue growth has been consistent across all major segments, with particularly strong results in the enterprise division. Management attributes this success to a combination of product innovation and strategic market positioning.",
  "During the site visit, the facilities demonstrated a high level of operational efficiency with modern equipment and well-organized workflow processes. The production capacity appears sufficient to support projected growth targets over the next three to five years. Safety protocols and quality control measures were observed to be in compliance with industry standards.",
  "Analysis of the competitive landscape reveals a favorable positioning relative to key peers. The company maintains several sustainable competitive advantages including proprietary technology, long-standing customer relationships, and a geographically diversified operational footprint. Market share has been trending upward over the past several quarters.",
  "Financial performance for the trailing twelve months indicates strong momentum with revenue increasing and margin expansion driven by operational leverage and cost discipline. The balance sheet remains well-positioned with manageable debt levels and adequate liquidity to fund planned capital expenditures and potential acquisition activity.",
  "The management team brings extensive industry experience with an average tenure of over fifteen years in relevant leadership roles. The organizational structure supports clear accountability and decision-making authority. Recent additions to the team have strengthened capabilities in technology and business development.",
  "Key risks identified during the assessment include customer concentration, regulatory changes in certain markets, and potential supply chain disruptions. However, management has implemented mitigation strategies including diversification efforts, compliance monitoring systems, and dual-sourcing arrangements for critical inputs.",
  "The technology platform has been modernized over the past two years with significant investment in cloud infrastructure, data analytics capabilities, and customer-facing digital tools. The IT roadmap includes planned enhancements to automation and integration that are expected to drive further efficiency improvements.",
  "Customer feedback collected through multiple channels indicates high satisfaction levels and strong loyalty metrics. Net promoter scores have improved year-over-year, and contract renewal rates remain above industry averages. The sales pipeline shows healthy activity across both existing and prospective accounts.",
]

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function generateMockOutline(numTopics = null) {
  const count = numTopics || (4 + Math.floor(Math.random() * 3)) // 4-6 topics
  const topics = shuffleArray(TOPIC_TEMPLATES).slice(0, count)
  const subTopics = shuffleArray(SUB_TOPIC_TEMPLATES)

  let subIndex = 0
  return topics.map(title => {
    const numSubs = 2 + Math.floor(Math.random() * 3) // 2-4 sub-topics
    const subs = []
    for (let i = 0; i < numSubs && subIndex < subTopics.length; i++) {
      subs.push({
        id: uuidv4(),
        text: subTopics[subIndex++],
      })
    }
    return {
      id: uuidv4(),
      title,
      subTopics: subs,
    }
  })
}

export function generateMockFinalContent(outline) {
  return {
    topics: outline.map(topic => ({
      id: topic.id,
      title: topic.title,
      content: LOREM_PARAGRAPHS[Math.floor(Math.random() * LOREM_PARAGRAPHS.length)],
      subTopics: topic.subTopics.map(sub => ({
        id: sub.id,
        title: sub.text,
        content: LOREM_PARAGRAPHS[Math.floor(Math.random() * LOREM_PARAGRAPHS.length)],
      })),
    })),
  }
}
