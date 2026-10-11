# The terminal sample of the release image (spec 9). VS Code and Windows Terminal both run it in this folder, with no
# prompt: witchyterm's ll without the owner column, then the 16 ANSI colours, each as text and as a swatch.
ll --no-user
echo
set -l names black red green yellow blue magenta cyan white
for i in (seq 0 7)
    set -l name $names[(math $i + 1)]
    printf '\e[3%sm%-8s\e[0m \e[4%sm      \e[0m \e[10%sm      \e[0m \e[9%smbright %s\e[0m\n' $i $name $i $i $i $name
end
sleep 3600
