desc 'Start Jekyll server and watch Sass/Bourbon files'
task :serve do
  puts "***************************************************"
  puts "* Watching Sass files. *"
  puts "***************************************************"
  sassPid = Process.spawn('sass -r sass-globbing --watch app/sass:app/styles')

  # Kills processes when you hit CTRL + C
  trap("INT") {
    [sassPid].each { |pid| Process.kill(9, pid) rescue Errno::ESRCH }
    exit 0
  }

  [sassPid].each { |pid| Process.wait(pid) }
end
