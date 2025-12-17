import { FileText, ImageIcon, Film, Music, Archive, File } from "lucide-react"

interface AttachmentPreviewProps {
  fileName: string
  fileType: string
  url: string
}

export function AttachmentPreview({ fileName, fileType, url }: AttachmentPreviewProps) {
  const getIcon = () => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8" />
    }
    if (fileType.startsWith("video/")) {
      return <Film className="h-8 w-8" />
    }
    if (fileType.startsWith("audio/")) {
      return <Music className="h-8 w-8" />
    }
    if (fileType === "application/pdf") {
      return <FileText className="h-8 w-8" />
    }
    if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) {
      return <Archive className="h-8 w-8" />
    }
    return <File className="h-8 w-8" />
  }

  const isImage = fileType.startsWith("image/")

  return (
    <div className="flex flex-col items-center gap-2">
      {isImage ? (
        <img src={url || "/placeholder.svg"} alt={fileName} className="max-h-32 max-w-full rounded-md object-contain" />
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {getIcon()}
        </div>
      )}
      <p className="text-xs text-center text-muted-foreground truncate max-w-full">{fileName}</p>
    </div>
  )
}
