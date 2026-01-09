# Homebrew Cask formula for IHW-ZoZ
# To use, create a tap repository (homebrew-ihwzoz) and add this file
#
# Installation:
#   brew tap maplex18/ihwzoz
#   brew install --cask ihwzoz

cask "ihwzoz" do
  version "1.0.0"
  sha256 "a5336afa5568115bc36053e53053050733f172def4e61c361d305fb06cceab21"

  url "https://github.com/maplex18/IHW-ZoZ/releases/download/v#{version}/IHW-ZoZ-#{version}-arm64.dmg"
  name "IHW-ZoZ"
  desc "Cross-platform local media processing tool"
  homepage "https://github.com/maplex18/IHW-ZoZ"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "IHW-ZoZ.app"

  zap trash: [
    "~/Library/Application Support/IHW-ZoZ",
    "~/Library/Application Support/ihw-zoz",
    "~/Library/Caches/IHW-ZoZ",
    "~/Library/Caches/ihw-zoz",
    "~/Library/Logs/IHW-ZoZ",
    "~/Library/Preferences/com.ihw-zoz.app.plist",
    "~/Library/Saved Application State/com.ihw-zoz.app.savedState",
  ]
end
