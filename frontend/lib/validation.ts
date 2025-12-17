export const emailValidation = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidEmailList(emails: string): boolean {
    const emailList = emails.split(",").map((e) => e.trim())
    return emailList.every((email) => this.isValidEmail(email))
  },

  validateEmailComposer(data: {
    para: string
    cc?: string
    bcc?: string
    assunto: string
    corpo: string
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.para.trim()) {
      errors.push("O campo 'Para' é obrigatório")
    } else if (!this.isValidEmailList(data.para)) {
      errors.push("Um ou mais emails em 'Para' são inválidos")
    }

    if (data.cc && !this.isValidEmailList(data.cc)) {
      errors.push("Um ou mais emails em 'Cc' são inválidos")
    }

    if (data.bcc && !this.isValidEmailList(data.bcc)) {
      errors.push("Um ou mais emails em 'Bcc' são inválidos")
    }

    if (!data.assunto.trim()) {
      errors.push("O assunto é obrigatório")
    }

    if (!data.corpo.trim()) {
      errors.push("O corpo do email é obrigatório")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  validateAttachmentSize(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `O arquivo ${file.name} excede o tamanho máximo de ${maxSizeMB}MB`,
      }
    }
    return { valid: true }
  },

  validateTotalAttachmentsSize(files: File[], maxSizeMB = 25): { valid: boolean; error?: string } {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const maxSize = maxSizeMB * 1024 * 1024

    if (totalSize > maxSize) {
      return {
        valid: false,
        error: `O tamanho total dos anexos excede ${maxSizeMB}MB`,
      }
    }
    return { valid: true }
  },
}
