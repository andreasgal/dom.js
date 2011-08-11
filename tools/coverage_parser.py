
PC_COUNTS = '--- PC COUNTS'
HEADERS = 'loc   counts           x line  op'
DIVIDER = '----- ----------------   ----  --'
END_PC_COUNTS = '--- END PC COUNTS'

JAVASCRIPT_PATH = ['tests/cmdline', 'tests/jsdom']


import os, sys

if len(sys.argv) < 2:
    print "Usage: %s disassembly.out" % (sys.argv[0], )
    sys.exit(1)

disassemblies = file(os.path.basename(sys.argv[1]), 'r')
disassembly_files = {}
covered_files = []

for disassembly_line in disassemblies:
    disassembly_parts = disassembly_line.split()

    if disassembly_line.startswith(PC_COUNTS):
        disassembly_source_file = disassembly_line[len(PC_COUNTS):].split(':')[0].strip()
        for lib_path in JAVASCRIPT_PATH:
            disassembly_filename = os.path.join(lib_path, disassembly_source_file)
            if os.path.exists(disassembly_filename):
                break
        else:
            print "Could not find source file", disassembly_source_file
            continue
        if disassembly_filename not in disassembly_files:
            disassembly_files[disassembly_filename] = {}
        continue

    if (disassembly_line.startswith(HEADERS)
    or disassembly_line.startswith(DIVIDER)
    or disassembly_line.startswith(END_PC_COUNTS)
    or len(disassembly_parts) < 4):
        continue

    execute_count = int(disassembly_parts[0].split(':')[1].split('/')[0])
    line_number = int(disassembly_parts[2])

    file_line_numbers = disassembly_files[disassembly_filename]
    file_line_numbers[line_number] = file_line_numbers.get(line_number, 0) + execute_count


for filename in disassembly_files:
    linenos = disassembly_files[filename]

    file_contents = file(filename, 'r')

    num_lines = len(linenos)
    covered_lines = len([x for x in linenos if linenos[x]])
    percentage = float(covered_lines) / float(num_lines)

    if percentage < 1:
        print filename
        print "\t%d of %d total lines covered. (%2d%%)" % (covered_lines, num_lines, percentage * 100)
    else:
        covered_files.append(filename)

    coverage_name = filename + '-coverage.html'
    coverage_file = file(coverage_name, 'w')
    coverage_file.write(
        '<html><head><style type="text/css">'
        'div {white-space: pre; font-family: monospace}'
        ' .covered {color: green}'
        ' .uncovered {color: red}'
        ' .unexecutable {color: gray}'
        ' .execute_count {float: right}</style></head><body><h1>%s</h1>\n' % (coverage_name, ))

    coverage_file.write('<div>%d lines of %d total covered. (%d%%)</div>' % (
        covered_lines, num_lines, percentage * 100))

    file_lines = []

    for i, line in enumerate(file_contents):
        file_lines.append(line)

        if i + 1 in linenos:
            execute_count = linenos[i+1]
            if execute_count:
                execute_count = str(execute_count)
                covered = 'covered'
            else:
                execute_count = ''
                covered = 'uncovered'
        else:
            execute_count = ''
            covered = 'unexecutable'
        coverage_file.write('<div class="%s"><span class="execute_count">%s</span> %s</div>\n' % (covered, execute_count, line))

    coverage_file.write('</body></html>')
    coverage_file.close()

    profile_name = filename + '-profile.html'
    profile_file = file(profile_name, 'w')
    profile_file.write(
        '<html><head><style type="text/css">'
        'div {white-space: pre; font-family: monospace; clear: both}'
        ' .execute_count { float: right }'
        ' .line_number { color: blue; float: left; width: 7em; }'
        '</style></head><body><h1>%s</h1>\n' % (profile_name, ))

    profile_data = [(execute_count, line_number) for (line_number, execute_count) in linenos.items()]
    profile_data.sort()
    profile_data.reverse()

    for execute_count, line_number in profile_data:
        if not execute_count:
            continue

        try:
            profile_file.write('<div><span class="line">%s</span><span class="line_number">%s</span><span class="execute_count">%s</span></div>' % (
                file_lines[line_number - 1].strip(), line_number, execute_count))
        except IndexError:
            pass

    profile_file.write('</body></html>')
    profile_file.close()


print "Covered:"
for x in covered_files:
    print x

