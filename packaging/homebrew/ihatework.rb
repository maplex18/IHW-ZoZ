# Homebrew Cask formula for IHateWork
# To use, create a tap repository (homebrew-ihatework) and add this file
#
# Installation:
#   brew tap maplex18/ihatework
#   brew install --cask ihatework

cask "ihatework" do
  version "1.0.0"
  sha256 "REPLACE_WITH_ACTUAL_SHA256"

  url "https://github.com/maplex18/IHateWork/releases/download/v#{version}/IHateWork-#{version}-mac.dmg"
  name "IHateWork"
  desc "Cross-platform local media processing tool"
  homepage "https://github.com/maplex18/IHateWork"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "IHateWork.app"

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
