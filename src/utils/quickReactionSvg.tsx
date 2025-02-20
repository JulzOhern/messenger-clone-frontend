export function QuickReactionSvg({ quickReactionSize }: { quickReactionSize: string }) {
  return (
    <svg
      aria-hidden="true"
      className="xsrhx6k transition-all duration-300"
      height={
        quickReactionSize === 'small' ? '55' :
          quickReactionSize === 'medium' ? '85' :
            quickReactionSize === 'large' ? '110' : '20'
      }
      viewBox="0 0 22 23"
      fill="#0e92eb"
      width={
        quickReactionSize === 'small' ? '55' :
          quickReactionSize === 'medium' ? '85' :
            quickReactionSize === 'large' ? '110' : '20'
      }
    >
      <path
        d="M10.987 0c1.104 0 3.67.726 3.67 5.149 0 1.232-.123 2.001-.209 2.534a16.11 16.11 0 00-.048.314l-.001.005a.36.36 0 00.362.406c4.399 0 6.748 1.164 6.748 2.353 0 .533-.2 1.02-.527 1.395a.11.11 0 00.023.163 2.13 2.13 0 01.992 1.79c0 .86-.477 1.598-1.215 1.943a.11.11 0 00-.046.157c.207.328.329.713.329 1.128 0 .946-.547 1.741-1.406 2.029a.109.109 0 00-.068.137c.061.184.098.38.098.584 0 1.056-1.776 1.913-5.95 1.913-3.05 0-5.154-.545-5.963-.936-.595-.288-1.276-.81-1.276-2.34v-6.086c0-1.72.958-2.87 1.911-4.014C9.357 7.49 10.3 6.36 10.3 4.681c0-1.34-.091-2.19-.159-2.817-.039-.368-.07-.66-.07-.928 0-.527.385-.934.917-.936zM3.5 11h-2C.5 11 0 13.686 0 17s.5 6 1.5 6h2a1 1 0 001-1V12a1 1 0 00-1-1z"
        fill="var(--chat-composer-button-color)"
      >
      </path>
    </svg>
  )
}
