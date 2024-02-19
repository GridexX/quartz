import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

function Image({ displayClass }: QuartzComponentProps) {
  return <img class={classNames(displayClass, "image")} width={150} src="https://2.gravatar.com/avatar/fea6d3afb018b20c87bb28b899a8347dfa7253a1fe20d4337f246ffd048f396a?size=256" ></img>
}

export default (() => Image) satisfies QuartzComponentConstructor
