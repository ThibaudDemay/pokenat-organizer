#! /usr/bin/env python3

import argparse

parser = argparse.ArgumentParser()
parser.add_argument("id", type=int)
parser.add_argument("-l", "--line", type=int, default=5)
parser.add_argument("-c", "--col", type=int, default=6)

def main(id, line=5, col=6):
    num_by_box = line*col
    work_id = id - 1
    pk_box = (work_id // num_by_box)
    pos_in_box = work_id - (num_by_box * (work_id // num_by_box))
    pk_line = (pos_in_box // (col))
    pk_col = pos_in_box - (col * (pk_line))
#    pk_col = 0

    print("Pokedex National ID #%s" % id)
    print("Box: %s, line: %s, column: %s" % (pk_box + 1, pk_line + 1, pk_col + 1))

if __name__ == "__main__":
    args = parser.parse_args()
    if args.id < 1:
        print("Pokemon id can't be under 1")
        exit(-1)
    main(args.id, args.line, args.col)
