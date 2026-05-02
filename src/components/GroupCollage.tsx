import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupCollageProps {
  images: string[]
  className?: string
}

export function GroupCollage({ images, className }: GroupCollageProps) {
  const displayImages = images.slice(0, 4)
  const count = displayImages.length

  if (count === 0) {
    return (
      <div className={cn("aspect-square flex items-center justify-center bg-muted rounded-md overflow-hidden", className)}>
        <Layers className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className={cn("aspect-square grid gap-px bg-muted rounded-md overflow-hidden", className)}>
      {count === 1 && (
        <div className="relative h-full w-full">
          <img
            src={displayImages[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}

      {count === 2 && (
        <div className="grid grid-cols-2 h-full w-full gap-px">
          {displayImages.map((src, i) => (
            <div key={i} className="relative h-full w-full">
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {count === 3 && (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-px">
          <div className="relative col-span-1 row-span-2 h-full w-full">
            <img
              src={displayImages[0]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="relative col-span-1 row-span-1 h-full w-full">
            <img
              src={displayImages[1]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="relative col-span-1 row-span-1 h-full w-full">
            <img
              src={displayImages[2]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {count === 4 && (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-px">
          {displayImages.map((src, i) => (
            <div key={i} className="relative h-full w-full">
              <img
                src={src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
