import { useTheme } from "@/providers/themeprovider"

export function NoChatsSelectedSvg() {
  const { theme } = useTheme();

  return (
    <i
      data-visualcompletion="css-img"
      style={{
        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yd/r/JpdPZF6qqZN.png")',
        backgroundPosition: theme === 'dark' ? '0px 0px' : '0px -181px',
        backgroundSize: 'auto',
        width: '245px',
        height: '180px',
        backgroundRepeat: 'no-repeat',
        display: 'inline-block',
      }}
    />
  )
}
