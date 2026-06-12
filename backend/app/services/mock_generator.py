import random
import uuid
from ..models.notes import Outline, Topic, SubTopic, GeneratedNotes, TopicContent, SubTopicContent

TOPIC_TEMPLATES = [
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

SUB_TOPIC_TEMPLATES = [
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

LOREM_PARAGRAPHS = [
    "The team conducted a thorough review of the operational metrics and identified several areas where performance has exceeded initial expectations. Revenue growth has been consistent across all major segments, with particularly strong results in the enterprise division. Management attributes this success to a combination of product innovation and strategic market positioning.",
    "During the site visit, the facilities demonstrated a high level of operational efficiency with modern equipment and well-organized workflow processes. The production capacity appears sufficient to support projected growth targets over the next three to five years. Safety protocols and quality control measures were observed to be in compliance with industry standards.",
    "Analysis of the competitive landscape reveals a favorable positioning relative to key peers. The company maintains several sustainable competitive advantages including proprietary technology, long-standing customer relationships, and a geographically diversified operational footprint. Market share has been trending upward over the past several quarters.",
    "Financial performance for the trailing twelve months indicates strong momentum with revenue increasing and margin expansion driven by operational leverage and cost discipline. The balance sheet remains well-positioned with manageable debt levels and adequate liquidity to fund planned capital expenditures and potential acquisition activity.",
    "The management team brings extensive industry experience with an average tenure of over fifteen years in relevant leadership roles. The organizational structure supports clear accountability and decision-making authority. Recent additions to the team have strengthened capabilities in technology and business development.",
    "Key risks identified during the assessment include customer concentration, regulatory changes in certain markets, and potential supply chain disruptions. However, management has implemented mitigation strategies including diversification efforts, compliance monitoring systems, and dual-sourcing arrangements for critical inputs.",
    "The technology platform has been modernized over the past two years with significant investment in cloud infrastructure, data analytics capabilities, and customer-facing digital tools. The IT roadmap includes planned enhancements to automation and integration that are expected to drive further efficiency improvements.",
    "Customer feedback collected through multiple channels indicates high satisfaction levels and strong loyalty metrics. Net promoter scores have improved year-over-year, and contract renewal rates remain above industry averages. The sales pipeline shows healthy activity across both existing and prospective accounts.",
]


def generate_mock_outline(prompt: str, file_count: int) -> Outline:
    count = random.randint(4, 6)
    topics = random.sample(TOPIC_TEMPLATES, min(count, len(TOPIC_TEMPLATES)))
    sub_topics = random.sample(SUB_TOPIC_TEMPLATES, min(20, len(SUB_TOPIC_TEMPLATES)))

    sub_index = 0
    result = []
    for title in topics:
        num_subs = random.randint(2, 4)
        subs = []
        for _ in range(num_subs):
            if sub_index < len(sub_topics):
                subs.append(SubTopic(
                    id=str(uuid.uuid4())[:8],
                    text=sub_topics[sub_index],
                ))
                sub_index += 1
        result.append(Topic(id=str(uuid.uuid4())[:8], title=title, sub_topics=subs))

    return Outline(topics=result)


def generate_mock_content(outline: Outline) -> GeneratedNotes:
    topics = []
    for topic in outline.topics:
        sub_contents = []
        for sub in topic.sub_topics:
            sub_contents.append(SubTopicContent(
                id=sub.id,
                title=sub.text,
                content=random.choice(LOREM_PARAGRAPHS),
            ))
        topics.append(TopicContent(
            id=topic.id,
            title=topic.title,
            content=random.choice(LOREM_PARAGRAPHS),
            sub_topics=sub_contents,
        ))
    return GeneratedNotes(topics=topics)
