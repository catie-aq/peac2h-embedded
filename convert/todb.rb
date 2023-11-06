require "json"

if ARGV.length != 1
  puts "Usage: ruby todb.rb <filename>"
  exit
end

filename = ARGV[0]
file = File.open(filename)

if File.exist?("db.json")
  puts "Error: db.json already exists."
  exit
end

file_data = file.read
filename = ARGV[0]

puts "Opening #{filename}..."
file = File.open(filename)

file_data = file.read

## Parse the JSON data into a hash

data = JSON.parse(file_data)
data["id"] = "imported"
 
final_data = {"studies" => [data], 
              "subjects" => []} 

puts "Writing db.json... "
File.open("db.json", "w") do |f|
  f.write(JSON.pretty_generate(final_data))
end
puts "Write finished."
