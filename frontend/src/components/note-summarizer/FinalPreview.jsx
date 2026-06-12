import { Card, CardContent } from '@/components/ui/card'

export default function FinalPreview({ content }) {
  if (!content || !content.topics) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No content to preview.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-8 px-8 max-h-[600px] overflow-y-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b">
          Meeting Notes Summary
        </h1>

        {content.topics.map((topic, topicIndex) => (
          <div key={topic.id} className={topicIndex > 0 ? 'mt-8' : ''}>
            <h2 className="text-lg font-semibold text-primary mb-3">
              {topic.title}
            </h2>
            {topic.content && (
              <p className="text-sm text-foreground leading-relaxed mb-4">
                {topic.content}
              </p>
            )}

            {topic.sub_topics?.map(sub => (
              <div key={sub.id} className="ml-4 mt-4">
                <h3 className="text-base font-medium text-foreground mb-2">
                  {sub.title}
                </h3>
                {sub.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sub.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
