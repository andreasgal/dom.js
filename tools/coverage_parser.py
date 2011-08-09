
import os

os.chdir('tests/cmdline')

lines = file('coverage.out', 'r').readlines()


files = {}


for line in lines:
	filename, lineno = line.split("----------")

	if filename not in files:
		files[filename] = set()

	files[filename].add(int(lineno))


filenames = files.keys()
filenames.sort()


for filename in filenames:
	linenos = files[filename]

	file_contents = file(filename.strip(), 'r').readlines()

	coverage_name = filename.strip() + '-coverage.html'
	print "Creating", coverage_name
	coverage_file = file(coverage_name, 'w')
	coverage_file.write('<html><head><style type="text/css">div {white-space: pre; font-family: monospace} .covered {color: green} .uncovered{color: red}</style></head><body>\n')

	for i, line in enumerate(file_contents):
		if i + 1 in linenos:
			covered = 'covered'
		else:
			covered = 'uncovered'
		coverage_file.write('<div class="%s">%s</div>\n' % (covered, line))

	coverage_file.write('</body></html>')

